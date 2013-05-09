goog.require('inject');

describe('App', function() {
  describe('exported symbols', function() {
    it ('should have exported client.load', function() {
      console.log(client)
      assert(typeof client.load === 'function');
    });

    it ('should have exported client.start', function() {
      assert(typeof client.start === 'function');
    });
  });

  describe('#addApps', function() {
    it ('should add apps to apps_', function() {
      var appsArray = ['messaging', 'tracking'];
      client.App.addApps(appsArray);

      expect(client.App.getInstance().apps_).to.eql(appsArray);
    });
  });

  describe('#client.load', function() {
    // We cannot add this as we don't have any apps yet.
    it ('Should run any added apps');

    it ('Should throw an error on non existant apps', function() {
      client.App.addApps(['helloyoufool']);
      expect(client.load).to.throw(Error);
    });
  });

});