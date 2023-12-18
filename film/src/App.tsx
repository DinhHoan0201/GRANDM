import React, { useEffect, useState } from "react";
import "firebase/database";
import "./App.css";
import "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, onValue } from "firebase/database";

const apiKey = "95c77b4ffbd4a5cc35c3b79d2b9aa4fb";
const baseUrl = "https://api.themoviedb.org/3/movie/top_rated";
const imageSize = "w500";

const firebaseConfig = {
  apiKey: "AIzaSyBs-zwZXTUkrKxDcjDe24gAH-gnEm66-ok",
  authDomain: "filmdb-ba825.firebaseapp.com",
  projectId: "filmdb-ba825",
  storageBucket: "filmdb-ba825.appspot.com",
  messagingSenderId: "670894660632",
  appId: "1:670894660632:web:37be4595ed4be05369f76d",
  measurementId: "G-8MN904QWVW",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

type MovieProps = {
  adult: boolean;
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
};

function App() {
  const [data, setData] = useState<MovieProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage, setMoviesPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${baseUrl}?api_key=${apiKey}&page=${currentPage}`
        );
        const jsonData = await response.json();

        const databaseRef = ref(database, "movies");
        push(databaseRef, jsonData.results);

        setData((prevData) => [...prevData, ...jsonData.results]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentPage]);

  useEffect(() => {
    const fetchDataFromFirebase = () => {
      const databaseRef = ref(database, "movies");
      onValue(databaseRef, (snapshot) => {
        const firebaseData = snapshot.val();
        if (firebaseData) {
          const moviesFromFirebase = Object.values(
            firebaseData
          ).flat() as MovieProps[];
          setData(moviesFromFirebase);
        }
      });
    };

    fetchDataFromFirebase();
  }, []);

  const loadMore = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const showMoreMovies = () => {
    setMoviesPerPage((prevCount) => prevCount + 10);
  };

  return (
    <div className="App">
      <h1 className="title">Movies List</h1>
      <div className="listFilm">
        {data.slice(0, moviesPerPage).map((movie) => (
          <div key={movie.id}>
            <h2>{movie.title}</h2>
            <img
              src={`https://image.tmdb.org/t/p/${imageSize}${movie.backdrop_path}`}
              alt={movie.title}
            />
            <h4>{movie.release_date}</h4>
            <p>{movie.adult ? "Dưới 18 tuổi " : "Trên 18 tuổi "}</p>
            <p>{movie.vote_average}</p>
            <p>{movie.vote_count}</p>
            <p>{movie.overview}</p>
          </div>
        ))}
      </div>
      {data.length > moviesPerPage && (
        <button onClick={showMoreMovies}>Read More</button>
      )}
    </div>
  );
}

export default App;
