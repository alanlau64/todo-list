//console.log("hello world")

/* 
  client side
    template: static template
    logic(js): MVC(model, view, controller): used to server side technology, single page application
        model: prepare/manage data,
        view: manage view(DOM),
        controller: business logic, event bindind/handling

  server side
    json-server
    CRUD: create(post), read(get), update(put, patch), delete(delete)


*/

//read
/* fetch("http://localhost:3000/todos")
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    }); */

import { myFetch } from "./myfetch.js";

const APIs = (() => {
    const createTodo = (newTodo) => {
        return myFetch("http://localhost:3000/todos", {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };

    const deleteTodo = (id) => {
        return myFetch("http://localhost:3000/todos/" + id, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    const getTodos = () => {
        return myFetch("http://localhost:3000/todos").then((res) => res.json());
    };

    const updateTodo = (id, newTodo) => {
        return myFetch("http://localhost:3000/todos/" + id, {
            method: "PUT",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json())
    };

    const patchTodo = (id, newItem) => {
        return myFetch("http://localhost:3000/todos/" + id, {
            method: "PATCH",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json())
    }

    return { getTodos, createTodo, deleteTodo, updateTodo, patchTodo };
})();

//IIFE
//todos
/* 
    hashMap: faster to search
    array: easier to iterate, has order
*/
const Model = (() => {
    class State {
        #todos; //private field
        #onChange; //function, will be called when setter function todos is called
        constructor() {
            this.#todos = [];
        }
        get todos() {
            return this.#todos;
        }
        set todos(newTodos) {
            // reassign value
            console.log("setter function");
            this.#todos = newTodos;
            this.#onChange?.(); // rendering
        }

        subscribe(callback) {
            //subscribe to the change of the state todos
            this.#onChange = callback;
        }
    }
    const { getTodos, createTodo, deleteTodo, updateTodo, patchTodo } = APIs;
    return {
        State,
        getTodos,
        createTodo,
        deleteTodo,
        updateTodo,
        patchTodo,
    };
})();
/* 
    todos = [
        {
            id:1,
            content:"eat lunch"
        },
        {
            id:2,
            content:"eat breakfast"
        }
    ]

*/
const View = (() => {
    const container = document.querySelector(".app")
    const todolistEl = document.querySelector(".todo-list");
    const donelistEl = document.querySelector(".done-list");
    const submitBtnEl = document.querySelector(".submit-btn");
    const inputEl = document.querySelector(".input");

    const editIcon = '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24"  aria-label="fontSize small"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>';
    const deleteIcon = '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>'
    const leftIcon = '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>'
    const rightIcon = '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIcon" aria-label="fontSize small"><path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg>'


    const renderTodos = (todos) => {
        console.log("rendering page")
        let todosTemplate = "";
        let donesTemplate = "";
        todos.forEach((todo) => {
            const done = todo.complete
            if (!done) {
                const liTemplate = `
                <li>
                    <span id="${todo.id} content">${todo.content}</span>
                    <button class="func-btn edit-btn" id="${todo.id} edit">${editIcon}</button>
                    <button class="func-btn delete-btn" id="${todo.id} del">${deleteIcon}</button>
                    <button class="func-btn done-btn" id="${todo.id} done">${rightIcon}</button>
                </li>`;
                todosTemplate += liTemplate;
            }
            else {
                const liTemplate = `
                <li>
                    <button class="func-btn undone-btn" id="${todo.id} undone">${leftIcon}</button>
                    <span id="${todo.id} content">${todo.content}</span>
                    <button class="func-btn edit-btn" id="${todo.id} edit">${editIcon}</button>
                    <button class="func-btn delete-btn" id="${todo.id} del">${deleteIcon}</button>
                </li>`;
                donesTemplate += liTemplate;
            }

        });
        if (todosTemplate === "") {
            todosTemplate = "You have finished all tasks!!";
        }
        if (donesTemplate === "") {
            donesTemplate = "You have not finished any task yet!!"
        }
        todolistEl.innerHTML = todosTemplate;
        donelistEl.innerHTML = donesTemplate;
    };

    const clearInput = () => {
        inputEl.value = "";
    };

    return { renderTodos, submitBtnEl, inputEl, clearInput, todolistEl, donelistEl, container };
})();

const Controller = ((view, model) => {
    const state = new model.State();
    const init = () => {
        model.getTodos().then((todos) => {
            todos.reverse();
            state.todos = todos;
        });
    };

    const handleSubmit = () => {
        view.submitBtnEl.addEventListener("click", (event) => {
            /* 
                1. read the value from input
                2. post request
                3. update view
            */
            const inputValue = view.inputEl.value;
            model.createTodo({ content: inputValue, complete: false }).then((data) => {
                state.todos = [data, ...state.todos];
                view.clearInput();
            });
        });
    };

    const handleDelete = () => {
        //event bubbling
        /* 
            1. get id
            2. make delete request
            3. update view, remove
        */
        view.container.addEventListener("click", (event) => {
            if (event.target.className === "func-btn delete-btn") {
                const id = event.target.id.split(" ")[0];
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
    };

    const handleStatusChange = () => {
        view.todolistEl.addEventListener("click", (event) => {
            if (event.target.className === "func-btn done-btn") {
                const id = event.target.id.split(" ")[0];
                const content = document.getElementById(`${id} content`).innerText
                model.updateTodo(+id, { content: content, complete: true }).then((data) => {
                    state.todos[state.todos.findIndex(item => item.id === +id)] = data;
                    state.todos = state.todos;
                });
            }
        });

        view.donelistEl.addEventListener("click", (event) => {
            if (event.target.className === "func-btn undone-btn") {
                const id = event.target.id.split(" ")[0];
                const content = document.getElementById(`${id} content`).innerText
                model.updateTodo(+id, { content: content, complete: false }).then((data) => {
                    state.todos[state.todos.findIndex(item => item.id === +id)] = data;
                    state.todos = state.todos;
                });
            }
        });
    }

    const handleEdit = () => {
        let editing = "";
        const edit = (complete) => {
            return (event) => {
                if (event.target.className === "func-btn edit-btn") {
                    const id = event.target.id.split(" ")[0];
                    if (editing != "" && editing != id) {
                        return;
                    }
                    const textBox = document.getElementById(`${id} content`);
                    if (textBox.nodeName == "SPAN") {
                        editing = id;
                        const inputBox = document.createElement("input");
                        inputBox.type = "text";
                        inputBox.value = textBox.innerText;
                        inputBox.id = `${id} content`;
                        textBox.replaceWith(inputBox);
                    }
                    else {
                        const newText = document.createElement("span");
                        const content = textBox.value;
                        newText.innerText = content;
                        newText.id = `${id} content`;
                        textBox.replaceWith(newText);

                        model.updateTodo(+id, { content: content, complete: complete }).then((data) => {
                            state.todos[state.todos.findIndex(item => item.id === +id)] = data;
                            state.todos = state.todos;
                        });
                        editing = "";
                    }
                }
            }
        };

        view.todolistEl.addEventListener("click", edit(false));
        view.donelistEl.addEventListener("click", edit(true));
    }

    const bootstrap = () => {
        init();
        handleSubmit();
        handleDelete();
        handleStatusChange();
        handleEdit();
        state.subscribe(() => {
            view.renderTodos(state.todos);
        });
    };
    return {
        bootstrap,
    };
})(View, Model); //ViewModel

Controller.bootstrap();
