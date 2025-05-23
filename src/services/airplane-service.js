const { AirplaneRepository } = require('../repositories/airplane-repository');


const airplaneRepository = new AirplaneRepository();

async function createAirplane(data) {
    try {
        if (!data) {
            throw new Error('Data is required to create an airplane');
        }
        if (!data.modelNumber) {
            throw new Error('Model number is a required field');
        }
        const airplane = await airplaneRepository.create(data);
        return airplane;

    } catch (error) {
        console.error('Error creating airplane:', error);
        throw error;
    }
}

module.exports = {
    createAirplane,
};