const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// In-memory to-do list
let todolist = [];

// Route for root path that redirects to /todo
app.get('/', (req, res) => {
    res.redirect('/todo');
});

// Route to display the to-do list
app.get('/todo', (req, res) => {
    res.render('todo', { todolist });
});

// Route to add a new to-do item
app.post('/todo/add', (req, res) => {
    const newTodo = req.body.newtodo.trim();
    if (newTodo) {
        todolist.push(newTodo);
    }
    res.redirect('/todo');
});

// Route to delete a to-do item
app.post('/todo/delete', (req, res) => {
    const index = parseInt(req.body.index);
    if (!isNaN(index) && index >= 0 && index < todolist.length) {
        todolist.splice(index, 1);
    }
    res.redirect('/todo');
});

// Start the server
app.listen(port, () => {
    console.log(`To-do app running at http://localhost:${port}`);
});
