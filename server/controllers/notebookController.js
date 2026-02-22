import Notebook from '../models/Notebook.js';

// @desc    Get all notebooks for user
// @route   GET /api/notebooks
// @access  Private
export const getNotebooks = async (req, res, next) => {
  try {
    const notebooks = await Notebook.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notebooks.length, data: notebooks });
  } catch (err) { next(err); }
}

// @desc    Get single notebook
// @route   GET /api/notebooks/:id
// @access  Private
export const getNotebook = async (req, res, next) => {
  try {
    const nb = await Notebook.findOne({ _id: req.params.id, user: req.user._id });
    if (!nb) return res.status(404).json({ success: false, message: 'Notebook not found' });
    res.status(200).json({ success: true, data: nb });
  } catch (err) { next(err); }
}

// @desc    Create notebook
// @route   POST /api/notebooks
// @access  Private
export const createNotebook = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const nb = await Notebook.create(req.body);
    res.status(201).json({ success: true, data: nb });
  } catch (err) { next(err); }
}

// @desc    Update notebook
// @route   PUT /api/notebooks/:id
// @access  Private
export const updateNotebook = async (req, res, next) => {
  try {
    const nb = await Notebook.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
    if (!nb) return res.status(404).json({ success: false, message: 'Notebook not found' });
    res.status(200).json({ success: true, data: nb });
  } catch (err) { next(err); }
}

// @desc    Delete notebook
// @route   DELETE /api/notebooks/:id
// @access  Private
export const deleteNotebook = async (req, res, next) => {
  try {
    const nb = await Notebook.findOne({ _id: req.params.id, user: req.user._id });
    if (!nb) return res.status(404).json({ success: false, message: 'Notebook not found' });
    await nb.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) { next(err); }
}
