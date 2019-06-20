const Todo = (($, appBasePath) => {
  const resourcePath = 'todo';
  const deleteActionsItemsSelector = 'a[data-action="delete"]';

  const onReady = () => {
    listenActionsClick();
  };

  const listenActionsClick = () => {
    // Listen for [todo] deletetion
    $(document).on('click', deleteActionsItemsSelector, handleDelete);
  };

  const handleDelete = (event) => {
    // Prevent hash navigation
    event.preventDefault();

    const todoId = event.target.getAttribute('data-todo-id');
    
    // If it doesn't has todoId defined just return
    if (!todoId) {
      return;
    }

    const callbackPath = event.target.getAttribute('data-callback-path');
    const todoDescription = event.target.getAttribute('data-todo-description');

    const modalMessage = `Do you want to delete '${todoDescription}'?`;
    const ajaxOptions = {
      method: 'delete',
      url: `${appBasePath}/${resourcePath}/${todoId}`
    };

    showModal(modalMessage)
      .then(() => ajaxRequestPromise(ajaxOptions))
      .then(() => {
        // If callback path configurated, it reload
        if (callbackPath) {
          window.location.href = `${appBasePath}/${callbackPath}`;
        } else {
          removeDomElementWithAnimation(todoId);
        }
      })
      .catch(() => null);
  };

  const showModal = (message) => {
    return new Promise((resolve, reject) => {
      // Modal ref
      const modalElem = $('#confirm-modal');
      // Default message
      const defaultMessage = 'Are you sure?';
  
      // Set modal body message
      modalElem.find('.modal-body').text(message || defaultMessage);
      // Show the modal
      modalElem.modal();
      // Listen modal buttons click
      modalElem.find('button').click((event) => {
        // Unbind the listener
        $(event.target).unbind(event);
        
        const modalResult = $(event.target).data('result');
        
        if (modalResult) {
          return reject();
        }

        return resolve();
      })
    });
  }

  const ajaxRequestPromise = (options) => {
    // Ajax Http Request
    return new Promise((resolve, reject) => {
      $.ajax(options)
        .fail((e) => reject(e))
        .done((data) => resolve(data));
    });
  };

  const removeDomElementWithAnimation = (todoId) => {
    // [todo] row ref
    const todoRow = $(`#todo-row-${todoId}`);
    // Fade out DOM element
    todoRow.fadeOut('slow', () => {
      // Remove DOM element
      todoRow.remove();
      // Refresh view
      fetch();
    });
  }

  const fetch = () => {
    const ajaxOptions = {
      url: `${appBasePath}/${resourcePath}`
    }

    ajaxRequestPromise(ajaxOptions)
      .then((todos) => parseTodos(todos));
  }

  const parseTodos = (todos) => {
    const todoRowTemplateRef = $('#todo-row-template');
    const todoRowStringTemplate = todoRowTemplateRef.html();
    const todosContainerRef = $('#todos-container');

    // Remove all existing ones
    todosContainerRef.empty();

    todos.forEach((todo) => {
      let newTodoRow = todoRowStringTemplate;
      
      // Adding custom template values
      todo.detail_href = `${appBasePath}/${resourcePath}/${todo.id}`;

      // Match [todo] properties
      Object.keys(todo).forEach(key => {
        const regExp = new RegExp(`\\$\\{${key}\\}`, 'g');
        newTodoRow = newTodoRow.replace(regExp, todo[key]);
      })

      todosContainerRef.append(newTodoRow);
    })
  }

  // Public methods
  return {
    onReady,
    fetch
  }
})($, appBasePath);