/* Collective error checking for all data files and routes*/

// Validate a string
function validString(input) {
   // Is the argument given?
   if (!input) {
      return false;
   }

   // Is the argument of type string?
   if (typeof input !== 'string') {
      return false;
   }

   // Is the input not just empty whitespace?
   if (input.trim().length === 0) {
      return false;
   }

   return true;
}

function validDateOfBirth(dob) {

}

module.exports = {
   validString
}