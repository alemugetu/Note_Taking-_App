import Tag from '../models/Tag.js';

// @desc    Get all tags for a user
// @route   GET /api/tags
// @access  Private
export const getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new tag
// @route   POST /api/tags
// @access  Private
export const createTag = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const tag = await Tag.create(req.body);

    res.status(201).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private
export const updateTag = async (req, res, next) => {
  try {
    let tag = await Tag.findOne({ _id: req.params.id, user: req.user._id });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
    }

    tag = await Tag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private
export const deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findOne({ _id: req.params.id, user: req.user._id });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
    }

    await tag.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
