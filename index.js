const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDej1XTIYA19hwZboUFfD0RhW7tp4hstJg',
  Promise: Promise
});

app.get('/distance', (req, res) => {
  const origin = req.query.origin; // Read the origin from the query string
  googleMapsClient.distanceMatrix({
    origins: [origin], // Use the origin from the frontend call
    destinations: ['6824 Fresh Meadow Ln, Fresh Meadows, NY 11365, United States'],
    mode: 'driving',
    units: 'metric'
  })
  .asPromise()
  .then(response => {
    const distance = response.json.rows[0].elements[0].distance.text;
    const duration = response.json.rows[0].elements[0].duration.text;
    res.json({distance, duration}); // Return distance and duration as JSON
  })
  .catch(err => {
    console.log(err);
    res.status(500).send('An error occurred while fetching the distance.');
  });
});

// New endpoint for address suggestions
app.get('/suggestions', (req, res) => {
  const input = req.query.input; // Read the user input from the query string
  if (!input) {
    return res.status(400).send('Input query parameter is required');
  }

  googleMapsClient.placesAutoComplete({
    input: input,
    language: 'en', // Optional: specify the language of the results
    // Optional: Add other parameters according to your requirements
  })
  .asPromise()
  .then(response => {
    // Extract suggestions from response and send them back to the client
    const suggestions = response.json.predictions.map(prediction => ({
      description: prediction.description,
      place_id: prediction.place_id // Include place_id if needed for further details lookup
    }));
    res.json({suggestions});
  })
  .catch(err => {
    console.error('Error fetching suggestions:', err);
    res.status(500).send('An error occurred while fetching suggestions.');
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server is running on port ${port}`));
