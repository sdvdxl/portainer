package stacks

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/asaskevich/govalidator"
	httperror "github.com/portainer/libhttp/error"
	"github.com/portainer/libhttp/request"
	"github.com/portainer/libhttp/response"
	portainer "github.com/portainer/portainer/api"
	bolterrors "github.com/portainer/portainer/api/bolt/errors"
	"github.com/portainer/portainer/api/filesystem"
	httperrors "github.com/portainer/portainer/api/http/errors"
	"github.com/portainer/portainer/api/http/security"
	"github.com/portainer/portainer/api/internal/stackutils"
)

type updateStackGitPayload struct {
	RepositoryReferenceName  string
	RepositoryAuthentication bool
	RepositoryUsername       string
	RepositoryPassword       string
}

func (payload *updateStackGitPayload) Validate(r *http.Request) error {
	if payload.RepositoryAuthentication && (govalidator.IsNull(payload.RepositoryUsername) || govalidator.IsNull(payload.RepositoryPassword)) {
		return errors.New("Invalid repository credentials. Username and password must be specified when authentication is enabled")
	}
	return nil
}

// PUT request on /api/stacks/:id/git?endpointId=<endpointId>
func (handler *Handler) stackUpdateGit(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	stackID, err := request.RetrieveNumericRouteVariableValue(r, "id")
	if err != nil {
		return &httperror.HandlerError{http.StatusBadRequest, "Invalid stack identifier route variable", err}
	}

	stack, err := handler.DataStore.Stack().Stack(portainer.StackID(stackID))
	if err == bolterrors.ErrObjectNotFound {
		return &httperror.HandlerError{http.StatusNotFound, "Unable to find a stack with the specified identifier inside the database", err}
	} else if err != nil {
		return &httperror.HandlerError{http.StatusInternalServerError, "Unable to find a stack with the specified identifier inside the database", err}
	}

	if stack.GitConfig == nil {
		return &httperror.HandlerError{http.StatusBadRequest, "Stack is not created from git", err}
	}

	// TODO: this is a work-around for stacks created with Portainer version >= 1.17.1
	// The EndpointID property is not available for these stacks, this API endpoint
	// can use the optional EndpointID query parameter to associate a valid endpoint identifier to the stack.
	endpointID, err := request.RetrieveNumericQueryParameter(r, "endpointId", true)
	if err != nil {
		return &httperror.HandlerError{http.StatusBadRequest, "Invalid query parameter: endpointId", err}
	}
	if endpointID != int(stack.EndpointID) {
		stack.EndpointID = portainer.EndpointID(endpointID)
	}

	endpoint, err := handler.DataStore.Endpoint().Endpoint(stack.EndpointID)
	if err == bolterrors.ErrObjectNotFound {
		return &httperror.HandlerError{http.StatusNotFound, "Unable to find the endpoint associated to the stack inside the database", err}
	} else if err != nil {
		return &httperror.HandlerError{http.StatusInternalServerError, "Unable to find the endpoint associated to the stack inside the database", err}
	}

	err = handler.requestBouncer.AuthorizedEndpointOperation(r, endpoint)
	if err != nil {
		return &httperror.HandlerError{http.StatusForbidden, "Permission denied to access endpoint", err}
	}

	resourceControl, err := handler.DataStore.ResourceControl().ResourceControlByResourceIDAndType(stackutils.ResourceControlID(stack.EndpointID, stack.Name), portainer.StackResourceControl)
	if err != nil {
		return &httperror.HandlerError{http.StatusInternalServerError, "Unable to retrieve a resource control associated to the stack", err}
	}

	securityContext, err := security.RetrieveRestrictedRequestContext(r)
	if err != nil {
		return &httperror.HandlerError{http.StatusInternalServerError, "Unable to retrieve info from request context", err}
	}

	access, err := handler.userCanAccessStack(securityContext, endpoint.ID, resourceControl)
	if err != nil {
		return &httperror.HandlerError{http.StatusInternalServerError, "Unable to verify user authorizations to validate stack access", err}
	}
	if !access {
		return &httperror.HandlerError{http.StatusForbidden, "Access denied to resource", httperrors.ErrResourceAccessDenied}
	}

	var payload updateStackGitPayload
	err = request.DecodeAndValidateJSONPayload(r, &payload)
	if err != nil {
		return &httperror.HandlerError{http.StatusBadRequest, "Invalid request payload", err}
	}

	stack.GitConfig.ReferenceName = payload.RepositoryReferenceName

	backupProjectPath := fmt.Sprintf("%s-old", stack.ProjectPath)
	err = filesystem.MoveDirectory(stack.ProjectPath, backupProjectPath)
	if err != nil {
		return &httperror.HandlerError{http.StatusInternalServerError, "Unable to move git repository directory", err}
	}

	err = handler.GitService.CloneRepository(stack.ProjectPath, stack.GitConfig.URL, payload.RepositoryReferenceName, payload.RepositoryUsername, payload.RepositoryPassword)
	if err != nil {
		restoreError := filesystem.MoveDirectory(backupProjectPath, stack.ProjectPath)
		if restoreError != nil {
			log.Printf("[WARN] [http,stacks,git] [error: %s] [message: failed restoring backup folder]", restoreError)
		}

		return &httperror.HandlerError{http.StatusInternalServerError, "Unable to clone git repository", err}
	}

	httpErr := handler.deployStack(r, stack, endpoint)
	if httpErr != nil {
		return httpErr
	}

	err = handler.DataStore.Stack().UpdateStack(stack.ID, stack)
	if err != nil {
		return &httperror.HandlerError{http.StatusInternalServerError, "Unable to persist the stack changes inside the database", err}
	}

	err = handler.FileService.RemoveDirectory(backupProjectPath)
	if err != nil {
		return &httperror.HandlerError{http.StatusInternalServerError, "Unable to remove git repository directory", err}
	}

	return response.JSON(w, stack)
}

func (handler *Handler) deployStack(r *http.Request, stack *portainer.Stack, endpoint *portainer.Endpoint) *httperror.HandlerError {
	if stack.Type == portainer.DockerSwarmStack {
		config, httpErr := handler.createSwarmDeployConfig(r, stack, endpoint, false)
		if httpErr != nil {
			return httpErr
		}

		err := handler.deploySwarmStack(config)
		if err != nil {
			return &httperror.HandlerError{http.StatusInternalServerError, err.Error(), err}
		}

		stack.UpdateDate = time.Now().Unix()
		stack.UpdatedBy = config.user.Username
		stack.Status = portainer.StackStatusActive

		return nil
	}

	config, httpErr := handler.createComposeDeployConfig(r, stack, endpoint)
	if httpErr != nil {
		return httpErr
	}

	err := handler.deployComposeStack(config)
	if err != nil {
		return &httperror.HandlerError{http.StatusInternalServerError, err.Error(), err}
	}

	stack.UpdateDate = time.Now().Unix()
	stack.UpdatedBy = config.user.Username
	stack.Status = portainer.StackStatusActive

	return nil
}
