import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { FaSistrix, FaArrowUp, FaArrowDown } from "react-icons/fa";
import Table from "react-bootstrap/Table";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./Config/FirebaseConfig";

const UserProfile = () => {
  const [loginDate, setLoginDate] = useState("");
  const [userName, setUserName] = useState("");
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filteredUserInput, setFilteredUserInput] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("SelectedID");
  const [filterOption, setFilterOption] = useState("Category");
  const [unverifiedQuestionsCount, setUnverifiedQuestionsCount] = useState(0);

  const handleDeleteRow = (id) => {
    const updatedData = filteredUserInput.filter(
      (user) => user.SelectedID !== id
    );
    setFilteredUserInput(updatedData);
  };

  const renderArrowIcon = (field) => {
    if (sortField === field) {
      return sortOrder === "asc" ? (
        <FaArrowUp style={{ color: "green" }} />
      ) : (
        <FaArrowDown style={{ color: "red" }} />
      );
    }
    return null;
  };

  useEffect(() => {
    const date = localStorage.getItem("loginDate");
    const userName = localStorage.getItem("username");

    setLoginDate(date);
    setUserName(userName);

    const uid = localStorage.getItem("uid");
    setUid(uid);

    const fetchData = async () => {
      try {
        const usersCollectionRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollectionRef);
        const usersData = [];
        const userInputsData = [];

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          const { userInputs } = userData;
          const userId = doc.id;

          if (userId === uid) {
            usersData.push({ id: userId, ...userData });
            if (userInputs) {
              for (const input of Object.values(userInputs)) {
                userInputsData.push(input);
              }
            }
          }
        });

        setUserInput(userInputsData);
        setUserDetails(usersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    setUserInput([]);
    setUserDetails([]);
    setUnverifiedQuestionsCount(0);

    fetchData();
  }, [uid]);

  useEffect(() => {
    const filteredData = userInput.filter((item) => {
      return (
        item.SelectedID.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.SelectedCategory.toLowerCase().includes(
          searchValue.toLowerCase()
        ) ||
        item.SelectedType.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.SelectedDifficulty.toLowerCase().includes(
          searchValue.toLowerCase()
        ) ||
        item.Question.toLowerCase().includes(searchValue.toLowerCase())
      );
    });

    setFilteredUserInput(filteredData);
  }, [userInput, searchValue]);

  useEffect(() => {
    const unverifiedCount = userDetails.reduce(
      (count, user) => count + (user.Verified === false ? 1 : 0),
      0
    );
    setUnverifiedQuestionsCount(unverifiedCount);
  }, [userDetails]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedUserInput = filteredUserInput.slice().sort((a, b) => {
    let fieldA = a[sortField];
    let fieldB = b[sortField];

    if (sortField === "SelectedID") {
      fieldA = parseInt(a[sortField]);
      fieldB = parseInt(b[sortField]);
    }

    if (sortOrder === "asc") {
      return fieldA < fieldB ? -1 : 1;
    } else {
      return fieldA > fieldB ? -1 : 1;
    }
  });
  // console.log(sortedUserInput);

  return (
    <div
      style={{ backgroundColor: "black", height: "90vh", overflowY: "auto" }}
    >
      <div className="d-flex mx-auto pt-3" style={{ width: "25em" }}>
        <Form.Control
          type="search"
          placeholder="Search"
          className="me-2"
          aria-label="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <select
          name="filterOption"
          style={{
            borderRadius: "0.3rem",
            margin: "0 0.5em",
            padding: "0.5em",
            backgroundColor: "white",
            color: "black",
          }}
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
        >
          <option value="Category">Category</option>
          <option value="Type">Type</option>
          <option value="Difficulty">Difficulty</option>
          <option value="Question">Question</option>
        </select>
      </div>
      <div className="w-75 m-auto">
        <h2 style={{ color: "rgb(139, 216, 188)" }} className="mt-3">
          {userName.charAt(0).toUpperCase() + userName.slice(1)}
          <span style={{ color: "white" }}>'s Profile</span>
        </h2>
        <Table striped bordered hover variant="dark" className="bg-dark mb-5">
          <thead>
            <tr>
              <th>Verified Questions</th>
              <th>Unverified Questions</th>
              <th>User Rank</th>
              <th>Join Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0</td>
              <td>{sortedUserInput.length}</td>
              <td>Standard User</td>
              <td>{loginDate}</td>
            </tr>
          </tbody>
        </Table>

        <section>
          <h4 style={{ color: "white" }}>Verified Questions</h4>
          <div
            style={{
              backgroundColor: "rgb(231, 76, 60)",
              height: "6vh",
              width: "75vw",
              margin: "1em  0",
            }}
          >
            <h5
              className="ms-2 "
              style={{ paddingTop: "0.5rem", fontSize: "17px" }}
            >
              No questions found!
            </h5>
          </div>
        </section>
        <section>
          <h4 style={{ color: "white" }}>Unverified Questions</h4>
          <div style={{ overflowY: "auto", maxHeight: "25vh" }}>
            {Array.isArray(sortedUserInput) && sortedUserInput.length === 0 ? (
              <div
                style={{
                  backgroundColor: "rgb(231, 76, 60)",
                  height: "6vh",
                  width: "75vw",
                  margin: "1em  0",
                }}
              >
                <h5
                  className="ms-2 "
                  style={{ paddingTop: "0.5rem", fontSize: "17px" }}
                >
                  No questions found!
                </h5>
              </div>
            ) : (
              <Table
                striped
                bordered
                hover
                variant="dark"
                className="bg-dark mb-5"
              >
                <thead>
                  <tr>
                    <th onClick={() => handleSort("SelectedID")}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {" "}
                        <span className="me-2">User ID</span>
                        {renderArrowIcon("SelectedID")}
                      </div>
                    </th>
                    <th>Category</th>
                    <th>Type </th>
                    <th>Difficulty</th>
                    <th>Question</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUserInput.map((user) => (
                    <tr key={user.id}>
                      <td>{user.SelectedID ? user.SelectedID : "N/A"}</td>
                      <td>{user.SelectedCategory}</td>
                      <td>{user.SelectedType}</td>
                      <td>{user.SelectedDifficulty}</td>
                      <td>{user.Question}</td>
                      <td>
                        <Button
                          size="sm"
                          style={{
                            background: "rgb(231, 76, 60)",
                            border: "none",
                          }}
                          onClick={() => handleDeleteRow(user.SelectedID)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
