const { Logger } = require('../config');

class CrudRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        // try {
        //     const response = await this.model.create(data);
        //     return response;
        // } catch (error) {
        //     Logger.error('something went wrong in the create method of CrudRepository', {
        //         stack: error.stack,
        //         errorCode: 'CRUD_REPOSITORY_CREATE_ERROR',
        //         data
        //     });
        //     throw error;
        // }
        const response = await this.model.create(data);
        return response;
    }

    async get(id) {
        try {
            const response = await this.model.findByPk(id);
            return response;
        } catch (error) {
            Logger.error('something went wrong in the get method of CrudRepository', {
                stack: error.stack,
                errorCode: 'CRUD_REPOSITORY_GET_ERROR',
                id
            });
            throw error;
        }
    }

    async getAll() {
        try {
            const response = await this.model.findAll();
            return response;
        } catch (error) {
            Logger.error('something went wrong in the getAll method of CrudRepository', {
                stack: error.stack,
                errorCode: 'CRUD_REPOSITORY_GET_ALL_ERROR'
            });
            throw error;
        }
    }

    async update(id, data) {
        try {
            const response = await this.model.update(data, { where: { id } });
            return response;
        } catch (error) {
            Logger.error('something went wrong in the update method of CrudRepository', {
                stack: error.stack,
                errorCode: 'CRUD_REPOSITORY_UPDATE_ERROR',
                id,
                data
            });
            throw error;
        }
    }

    async delete(id) {
        try {
            const response = await this.model.destroy({ where: { id } });
            return response;
        } catch (error) {
            Logger.error('something went wrong in the delete method of CrudRepository', {
                stack: error.stack,
                errorCode: 'CRUD_REPOSITORY_DELETE_ERROR',
                id
            });
            throw error;
        }
    }
}

module.exports = {
    CrudRepository
};