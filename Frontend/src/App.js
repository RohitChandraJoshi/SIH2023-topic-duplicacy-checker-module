// App.js
import React, { useState } from 'react';
import { compareTwoStrings } from 'string-similarity';
import axios from 'axios';
import Modal from 'react-modal';
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
    axios
      .get(`http://localhost:8080/get-google-scholar-results?topic=${encodeURIComponent(enteredTopic)}`)
      .then((response) => {
        const googleScholarResults = response.data.results;

        const existingTopics = googleScholarResults.map((result) => result.title);
        const links = googleScholarResults.map((result) => result.link);
        let highestSimilarity = 0;
        let similarTopicsList = [];

        for (let i = 0; i < existingTopics.length; i++) {
          const existingTopic = existingTopics[i];
          const similarityValue = compareTwoStrings(enteredTopic, existingTopic);

          if (similarityValue >= 0.6) {
            similarTopicsList.push({ topic: existingTopic, link: links[i] });
          }

          if (similarityValue > highestSimilarity) {
            highestSimilarity = similarityValue;
          }
        }

        const similarityPercentage = highestSimilarity * 100;
        setSimilarity(similarityPercentage);

        if (similarTopicsList.length > 0) {
          setTopicSubmitted(false);
          setSimilarTopics(similarTopicsList);
          setModalIsOpen(true);
        } else {
          axios
            .post('http://localhost:8080/submit-topic', {
              topic: enteredTopic,
              guide: selectedGuide,
              specialization: selectedSpecialization,
            })
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
    <div className="app-container">
      <h3 className="app-header" >Submit your Unique Topic</h3>
      <div className="form-group">
        <label htmlFor="topicInput"style={{fontSize:'17px'}}>Enter Topic:</label>
        <input
          type="text"
          className="form-control"
          id="topicInput"
          value={enteredTopic}
          onChange={(e) => setEnteredTopic(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="guideSelect" style={{fontSize:'17px'}}>Select Guide:</label>
        <select
          className="form-control"
          id="guideSelect"
          value={selectedGuide}
          onChange={(e) => setSelectedGuide(e.target.value)}
        >
          <option value="" disabled>
            Select a Guide
          </option>
          <option value="Dr Mohit Agrawal">Dr Anil Kumar</option>
          <option value="Dr Sandeep Kumar">Dr Sandeep Kumar</option>
          <option value="Dr Vishal Jain">Dr Vishal Jain</option>
          <option value="Dr Anil Kumar">Dr Anil Kumar</option>
          <option value="Ms Rani Astya">Ms Rani Astya</option>
          <option value="Ms Kanika">Ms Kanika</option>
          <option value="Ms Preeti Dubey">Ms Preeti Dubey</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="specializationSelect"style={{fontSize:'17px', fontWeight:'bold'}}>Select Specialization:</label>
        <select
          className="form-control"
          id="specializationSelect"
          value={selectedSpecialization}
          onChange={(e) => setSelectedSpecialization(e.target.value)}
        >
          <option value="" disabled >
            Select a Specialization
          </option>
          <option value="Biophysics">Biophysics</option>
          <option value="Community Medicine">Community Medicine</option>
          <option value="Dental Surgery">Dental Surgery</option>
          <option value="Emergency Medicine">Emergency Medicine</option>
          
        </select>
      </div>
      <div className = "compare-btn-container" >
      <button className="compare-btn" onClick={handleCompare}>
        Submit
      </button>
      </div>
      {similarity !== null && (
        <div>
          <p className="result-text">Similarity: {similarity.toFixed(2)}%</p>
        </div>
      )}
      {topicSubmitted && (
        <div>
          
          <p className="result-text" style={{color:'green'}}>Similarity is less than 60%, Topic submitted successfully!</p>

        </div>
      )}

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="custom-modal" overlayClassName="custom-overlay">
        <h2>😟 Topic similarity is too high! </h2>
        {similarity !== null && (
          <div>
            <p className="result-text" style={{color:"red"}}>Similarity: {similarity.toFixed(2)}%</p>
          </div>
        )}
        <p>Following are the similar topics, you can follow the links and get detailed information about articles.</p>
        <ul>
          {similarTopics.map((item, index) => (
            <li key={index}>
              <p>Topic: {item.topic}</p>
              <p>
                Link: <a href={item.link} target="_blank" rel="noopener noreferrer">{item.link}</a>
              </p>
            </li>
          ))}
        </ul>
        <p>
          Explore more topics on Google Scholar:{' '}
          <a href={`https://scholar.google.com/scholar?q=${enteredTopic}`} target="_blank" rel="noopener noreferrer">
            Go to Google Scholar
          </a>
        </p>
        <div className = "compare-btn-container" >
        <button className="close-btn" onClick={() => setModalIsOpen(false)}>
          Close
        </button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
