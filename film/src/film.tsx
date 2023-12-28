import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Container, Stack, Typography } from "@mui/material";
import Heart from "./heart";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
} from "firebase/firestore";

// Khởi tạo Firebase
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

const App: React.FC = () => {
  const [movieData, setMovieData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<number[]>([]);

  const loadMoreData = () => {
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    const fetchMovieData = async (currentPage: number) => {
      try {
        // Fetch favorites from Local Storage
        const storedFavorites = localStorage.getItem("favorites");
        console.log("Stored Favorites:", storedFavorites);

        // Kiểm tra storedFavorites có giá trị không
        if (storedFavorites) {
          const parsedFavorites = JSON.parse(storedFavorites);
          setFavorites(parsedFavorites || []);

          // Fetch favorites from Firestore if Local Storage is empty
          if (!parsedFavorites || parsedFavorites.length === 0) {
            const favoritesCollection = collection(db, "favoriteMovies");

            // Sử dụng `await` trong hàm được đánh dấu là `async`
            const favoritesSnapshot = await getDocs(favoritesCollection);
            const favoritesList = favoritesSnapshot.docs.map((doc) =>
              parseInt(doc.id)
            );
            setFavorites(favoritesList);
            localStorage.setItem("favorites", JSON.stringify(favoritesList));
          }
        }
      } catch (error) {
        console.error("Error parsing favorites from Local Storage:", error);
      }

      // Fetch movie data
      const response = await axios.get(
        "https://api.themoviedb.org/3/movie/top_rated",
        {
          params: {
            api_key: "e591ec5aa28bdc2d8090769a197cdbbe",
            page: currentPage,
          },
        }
      );
      const newMovies = response.data.results.slice(0, 5);
      setMovieData((prevData) =>
        currentPage === 1 ? newMovies : [...prevData, ...newMovies]
      );
    };

    fetchMovieData(page);
  }, [page, db]);

  const toggleFavorite = async (index: number) => {
    try {
      const movie = movieData[index];
      const movieRef = doc(db, "favoriteMovies", movie.id.toString());

      const updatedFavorites = [...favorites];
      const isFavorite = updatedFavorites.includes(movie.id);

      if (isFavorite) {
        const indexToRemove = updatedFavorites.indexOf(movie.id);
        updatedFavorites.splice(indexToRemove, 1);
      } else {
        updatedFavorites.push(movie.id);
      }

      setFavorites(updatedFavorites);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

      // Check if the document exists before updating
      const docSnapshot = await getDoc(movieRef);
      if (docSnapshot.exists()) {
        if (isFavorite) {
          // Unset movie as favorite in Firestore
          await updateDoc(movieRef, {
            isFavorite: false,
            favorites: arrayRemove(movie.id),
          });
        } else {
          // Set movie as favorite in Firestore
          await setDoc(movieRef, {
            isFavorite: true,
            favorites: arrayUnion(movie.id),
          });
        }
      }
    } catch (error) {
      console.error("Error updating favorite status on Firestore:", error);
    }
  };

  return (
    <div>
      <div>
        <Container>
          <Stack direction="column" flexWrap="wrap" textAlign="center">
            <Typography variant="h2">List Film</Typography>
            {movieData.map((movie: any, index: number) => {
              const starsCount: number = Math.min(
                Math.round(movie.vote_average / 2)
              );

              return (
                <Box
                  key={movie.id}
                  style={{
                    width: "200px",
                    margin: "10px",
                    display: "inline-block",
                  }}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
                    alt={movie.title}
                    width={1000}
                    height={500}
                  />
                  <Box>
                    <b>{movie.title}</b>
                  </Box>
                  <Box>
                    {[...Array(starsCount)].map((_, starIndex) => (
                      <span key={starIndex}>⭐</span>
                    ))}
                    <span>{movie.vote_average}</span>
                  </Box>
                  <Heart
                    isFavorite={favorites.includes(movie.id)}
                    onClick={() => toggleFavorite(index)}
                  />
                </Box>
              );
            })}
          </Stack>
        </Container>
        <Box textAlign={"center"}>
          <button onClick={loadMoreData}>Load more</button>
        </Box>
      </div>
    </div>
  );
};

export default App;
