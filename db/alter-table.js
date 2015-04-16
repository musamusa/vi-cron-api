var connection = require('./index.js');
connection.query("ALTER TABLE `Users` ADD COLUMN 'home_test' VARCHAR").spread(function(results, metadata) {
  // Results will be an empty array and metadata will contain the number of affected rows.
});