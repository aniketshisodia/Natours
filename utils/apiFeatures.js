const express = require('express');
const mongoose = require('mongoose');

class APIFeatures {
    // query       -> {"price" : "500" , "name" : "1000"} 
    // queryString -> {limit , page , id}
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 2.ADVANCED FILTERING
        // using less than or greater than
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // console.log(JSON.parse(queryStr));

        this.query.find(JSON.parse(queryStr));
        // let query = Tour.find(JSON.parse(queryStr));
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            // console.log(sortBy);
            this.query = this.query.sort(sortBy);
        }
        else {
            this.query = this.query.sort('ratingsAverage');
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v')
        }
        return this;
    }
    pagination() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
};


module.exports = APIFeatures;