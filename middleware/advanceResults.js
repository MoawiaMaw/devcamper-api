const advanceResult = (model, populate) => async (req, res, next) => {
    let query;

    //copy req.query
    const reqQuery = { ...req.query };

    //Field to exclued
    const removeFields = ['select', 'sort', 'limit', 'page'];

    //loop over removeFields and remove them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    //create query string
    let queryStr = JSON.stringify(reqQuery);
    //create operators $gt $gte...
    queryStr = queryStr.replace(/\b('|gt|gte|lt|lte|in|')\b/g, match => `$${match}`);

    query = model.find(JSON.parse(queryStr));

    //select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
    query = query.skip(startIndex).limit(limit);

    //pagination result 
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    if (populate) {
        query = query.populate(populate);
    }

    const results = await query;

    res.advanceResult = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next();
}

module.exports = advanceResult;