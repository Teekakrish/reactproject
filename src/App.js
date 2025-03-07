import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css"; // Ensure TailwindCSS is properly integrated

const App = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // Sorting by name
  const [totalPages, setTotalPages] = useState(0);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" || false
  );

  const usersPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!response.ok) {
          throw new Error("Failed to fetch data.");
        }
        const data = await response.json();
        setUsers(data);
        setTotalPages(Math.ceil(data.length / usersPerPage));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.scrollHeight - 5 &&
        currentPage < totalPages
      ) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentPage, totalPages]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    const companyParam = params.get("company");
    if (searchParam) setSearch(searchParam);
    if (companyParam) setCompanyFilter(companyParam);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode); // Save dark mode preference
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Debounce search input using useCallback
  const debounceSearch = useCallback(
    (e) => {
      setSearch(e.target.value);
    },
    [setSearch]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debounceSearch({ target: { value: search } });
    }, 300); // 300ms debounce
    return () => clearTimeout(timeoutId);
  }, [search, debounceSearch]);

  // Filter users by name and company
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const isNameMatch = user.name.toLowerCase().includes(search.toLowerCase());
      const isCompanyMatch = companyFilter
        ? user.company.name.toLowerCase() === companyFilter.toLowerCase()
        : true;
      return isNameMatch && isCompanyMatch;
    });
  }, [users, search, companyFilter]);

  // Sorting the filtered users
  const sortedUsers = useMemo(() => {
    return filteredUsers.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  }, [filteredUsers, sortOrder]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  const changePage = (direction) => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage + direction;
      return Math.min(Math.max(newPage, 1), totalPages);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-indigo-600 to-pink-500">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 text-white p-4 rounded-lg text-center mt-10">
        <p className="text-xl font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-5 ${darkMode ? "bg-gray-900 text-gray-300" : "bg-white text-black"}`}
    >
      <div className="flex justify-between items-center mb-12 flex-col sm:flex-row">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 text-center sm:text-left">
          User Dashboard
        </h1>
        <button
          onClick={toggleDarkMode}
          className="p-4 rounded-full bg-gradient-to-r from-teal-500 via-green-400 to-blue-500 text-white shadow-lg hover:bg-gradient-to-l hover:scale-105 transition-all duration-300 mt-6 sm:mt-0"
        >
          {darkMode ? (
            <span className="material-icons">toggle_on</span>
          ) : (
            <span className="material-icons">toggle_off</span>
          )}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4 sm:flex sm:space-y-0 sm:gap-4 sm:mb-10">
        <input
          type="text"
          placeholder="Search by name"
          className="p-3 border rounded-lg w-full sm:w-1/2 md:w-1/3"
          onChange={debounceSearch}
        />
        <select
          className="p-3 border rounded-lg w-full sm:w-1/2 md:w-1/3"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="">Select Company</option>
          {Array.from(new Set(users.map((user) => user.company.name))).map((company, index) => (
            <option key={index} value={company}>
              {company}
            </option>
          ))}
        </select>
      </div>

      {/* User Cards */}
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentUsers.map((user) => (
          <div
            key={user.id}
            className="p-6 bg-gradient-to-r from-purple-500 to-pink-600 text-gray-200 rounded-lg shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative mb-4">
              <img
                src={`https://i.pravatar.cc/150?img=${user.id}`}
                alt={user.name}
                className="w-28 h-28 rounded-full mx-auto transform transition-transform duration-300 hover:scale-125 hover:shadow-xl"
                loading="lazy"
              />
            </div>
            <h3 className="text-2xl font-semibold text-center mb-2 text-indigo-300 hover:text-white">
              {user.name}
            </h3>
            <p className="text-sm text-center mb-1 text-gray-400 hover:text-white">{user.email}</p>
            <p className="text-sm text-center mb-1 text-gray-400 hover:text-white">{user.phone}</p>
            <p className="text-sm text-center text-gray-400 hover:text-white">{user.company.name}</p>
          </div>
        ))}
      </div>

      {/* Sorting Button */}
      <div className="flex justify-between items-center mt-6 mb-4">
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 via-green-400 to-blue-500 text-white rounded-full hover:bg-gradient-to-l transition-all duration-300"
        >
          Sort by Name ({sortOrder === "asc" ? "A-Z" : "Z-A"})
        </button>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => changePage(-1)}
          disabled={currentPage === 1}
          className="px-6 py-3 bg-gradient-to-r from-teal-500 via-green-400 to-blue-500 text-white rounded-full disabled:opacity-50 hover:bg-gradient-to-l transition-all duration-300"
        >
          Prev
        </button>
        <span className="text-lg font-semibold text-indigo-500">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => changePage(1)}
          disabled={currentPage === totalPages}
          className="px-6 py-3 bg-gradient-to-r from-teal-500 via-green-400 to-blue-500 text-white rounded-full disabled:opacity-50 hover:bg-gradient-to-l transition-all duration-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default App;
