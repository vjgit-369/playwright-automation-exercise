/**
 * Utility functions for generating test data
 */
const faker = require('faker');

/**
 * Generate unique user data for registration
 * @returns {Object} User data object with name, email, password
 */
function generateUserData() {
  const timestamp = new Date().getTime();
  const name = `user_${timestamp}`;
  const email = `test_${timestamp}@mailinator.com`;
  const password = `Test@${timestamp.toString().substring(7)}`;
  
  return {
    name,
    email,
    password,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    company: faker.company.companyName(),
    address1: faker.address.streetAddress(),
    address2: faker.address.secondaryAddress(),
    country: 'United States',
    state: faker.address.state(),
    city: faker.address.city(),
    zipcode: faker.address.zipCode(),
    mobileNumber: faker.phone.phoneNumber('##########')
  };
}

/**
 * Generate payment information for checkout
 * @returns {Object} Payment data
 */
function generatePaymentData() {
  return {
    nameOnCard: faker.name.findName(),
    cardNumber: '4111111111111111', // Test card number
    cvc: '123',
    expiryMonth: '12',
    expiryYear: '2030'
  };
}

module.exports = {
  generateUserData,
  generatePaymentData
};