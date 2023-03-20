const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

//Route 1:to fetch Notes of current user (login required)
router.get('/fetchAllNotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

//Route 2:to add Notes of current user (login required)
router.post('/addnotes', fetchuser, [
    body('title', 'Enter a valid Title').isLength({ min: 3 }),//validation
    body('description', 'Description must be of atleast 5 characters').isLength({ min: 5 }),//validation
], async (req, res) => {
    try {

        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const saveNotes = await note.save();

        res.json(saveNotes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

//Route 3:to Update Notes of current user (login required)
router.put('/updatenotes/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //create a new noteobject
        const newnote = {};
        if (title) { newnote.title = title };
        if (description) { newnote.description = description };
        if (tag) { newnote.tag = tag };

        //finding the note to be updated
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }
        if (note.user.toString() !== req.user.id) {
            res.status(401).send("Not Allowed")
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newnote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})
//Route 4:to Delete Notes of current user (login required)
router.delete('/deletenotes/:id', fetchuser, async (req, res) => {
    try {
        //Finding the note to be deleted
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }
        if (note.user.toString() !== req.user.id) {
            res.status(401).send("Not Allowed")
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})
module.exports = router;