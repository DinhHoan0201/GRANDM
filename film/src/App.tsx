import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";

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
const db = getFirestore(app);

function App() {
  const [movieTitle, setMovieTitle] = useState("");
  const createMovie = async () => {
    try {
      await setDoc(doc(db, "movies", movieTitle), { title: movieTitle });
      console.log("Movie successfully added!");
      setMovieTitle("");
      fetchMovies();
    } catch (error) {
      console.error("Error adding movie: ", error);
    }
  };

  const [movies, setMovies] = useState<string[]>([]);
  const fetchMovies = async () => {
    try {
      const getData = await getDocs(collection(db, "movies"));
      const movieList: any[] | ((prevState: string[]) => string[]) = [];
      getData.forEach((doc) => {
        movieList.push(doc.data().title);
      });
      setMovies(movieList);
    } catch (error) {
      console.error("Error fetching movies: ", error);
    }
  };

  const deleteMovie = async (movieTitle: string) => {
   
    try {
       const title = doc(db, "movies", movieTitle);
      await deleteDoc(title);
      console.log("Movie successfully deleted!");
      fetchMovies();
    } catch (error) {
      console.error("Error deleting movie: ", error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div>
      <h1>Add Movie Title</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMovie();
        }}
      >
        <label>
          Movie Title:
          <input
            type="text"
            value={movieTitle}
            onChange={(e) => setMovieTitle(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Add Movie</button>
      </form>

      <h2>List of Movies</h2>
      <ul>
        {movies.map((movie, index) => (
          <li key={index}>
            {movie}
            <button onClick={() => deleteMovie(movie)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
