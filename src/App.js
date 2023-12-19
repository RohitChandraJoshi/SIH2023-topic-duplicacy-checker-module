// App.js
import React, { useState, useEffect } from 'react';
import { compareTwoStrings } from 'string-similarity';
import axios from 'axios';
import Modal from 'react-modal';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './App.css'; 

function App() {
  const [enteredTopic, setEnteredTopic] = useState('');
  const [selectedGuide, setSelectedGuide] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [similarity, setSimilarity] = useState(null);
  const [similarTopics, setSimilarTopics] = useState([]);
  const [topicSubmitted, setTopicSubmitted] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleCompare = () => {
    axios.get(`http://localhost:8080/get-google-scholar-results?topic=${encodeURIComponent(enteredTopic)}`)
      .then((response) => {
        const googleScholarResults = response.data.results;

        const existingTopics = googleScholarResults.map(result => result.title);

        let highestSimilarity = 0;
        let similarTopicsList = [];

        for (const existingTopic of existingTopics) {
          const similarityValue = compareTwoStrings(enteredTopic, existingTopic);

          if (similarityValue > highestSimilarity) {
            highestSimilarity = similarityValue;
            similarTopicsList = [existingTopic];
          } else if (similarityValue === highestSimilarity) {
            similarTopicsList.push(existingTopic);
          }
        }

        const similarityPercentage = highestSimilarity * 100;
        setSimilarity(similarityPercentage);

        if (similarityPercentage >= 70) {
          setTopicSubmitted(false);
          setSimilarTopics(similarTopicsList);
          setModalIsOpen(true);
        } else {
          axios.post('http://localhost:8080/submit-topic', { topic: enteredTopic, guide: selectedGuide, specialization: selectedSpecialization })
            .then((response) => {
              if (response.data.success) {
                console.log('Topic added to the database');
                setSimilarity(null);
                setSimilarTopics([]);
                setTopicSubmitted(true);
              } else {
                console.error('Failed to add topic:', response.data.message);
                setSimilarity(null);
                setSimilarTopics([]);
                setTopicSubmitted(false);
              }
            })
            .catch((error) => {
              console.error('Error adding topic:', error);
              setSimilarity(null);
              setSimilarTopics([]);
              setTopicSubmitted(false);
            });
        }
      })
      .catch((error) => {
        console.error('Error fetching Google Scholar results:', error);
      });
  };

  return (
    <div className="container">
      <h3 className="display-4">Submit your Unique Topic</h3>
      <div className="form-group">
        <label htmlFor="topicInput">Enter Topic:</label>
        <input
          type="text"
          className="form-control"
          id="topicInput"
          value={enteredTopic}
          onChange={(e) => setEnteredTopic(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="guideSelect">Select Guide:</label>
        <select
          className="form-control"
          id="guideSelect"
          value={selectedGuide}
          onChange={(e) => setSelectedGuide(e.target.value)}
        >
          <option value="" disabled>Select a Guide</option>
          <option value="Dr Sandeep Kumar">Dr Sandeep Kumar</option>
          <option value="Dr Vishal Jain">Dr Vishal Jain</option>
          <option value="Ms Akanksha">Ms Akanksha</option>
          <option value="Ms Kanika">Ms Kanika</option>
          <option value="Ms Preeti Dubey">Ms Preeti Dubey</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="specializationSelect">Select Specialization:</label>
        <select
          className="form-control"
          id="specializationSelect"
          value={selectedSpecialization}
          onChange={(e) => setSelectedSpecialization(e.target.value)}
        >
          <option value="" disabled>Select a Specialization</option>
          <option value="Specialization1">Biophysics</option>
          <option value="Specialization2">Community Medicine</option>
          <option value="Specialization2">Dental Surgery</option>
          <option value="Specialization2">Emergency Medicine</option>
          {/* Add more options as needed */}
        </select>
      </div>
      <button className="btn btn-primary" onClick={handleCompare}>
        Compare
      </button>
      {similarity !== null && (
        <div>
          <p>Similarity: {similarity.toFixed(2)}%</p>
        </div>
      )}
      {topicSubmitted && (
        <div>
          <p>Topic submitted successfully!</p>
        </div>
      )}
      
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
      >
        <h2>Topic similarity is too high!</h2>
        {similarity !== null && (
          <div>
            <p>Similarity: {similarity.toFixed(2)}%</p>
          </div>
        )}
        <p>Please choose a different topic.</p>
        <p>Similar Topics:</p>
        <ul>
          {similarTopics.map((topic, index) => (
            <li key={index}>{topic}</li>
          ))}
        </ul>
        <button className="btn btn-secondary" onClick={() => setModalIsOpen(false)}>
          Close
        </button>
      </Modal>
    </div>
  );
}

export default App;
