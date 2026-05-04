import React, { useState } from "react";
import { useHttp } from "../hooks/useHttp";
import { HttpMethod } from "../enums/http-method";

interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserPayload {
  name: string;
  email: string;
}

const HttpExample: React.FC = () => {
  // GET request example
  const {
    data: users,
    loading: fetchingUsers,
    error: fetchError,
    execute: fetchUsers,
  } = useHttp<User[]>();

  // POST request example
  const {
    loading: creatingUser,
    error: createError,
    execute: createUser,
  } = useHttp<User, CreateUserPayload>();

  // DELETE request example
  const {
    loading: deletingUser,
    error: deleteError,
    execute: deleteUser,
  } = useHttp<void>();

  const [newUser, setNewUser] = useState<CreateUserPayload>({
    name: "",
    email: "",
  });

  const handleFetchUsers = async () => {
    await fetchUsers(HttpMethod.GET, "/users");
  };

  const handleCreateUser = async () => {
    const created = await createUser(HttpMethod.POST, "/users", newUser);
    if (created) {
      alert(`User created: ${created.name}`);
      setNewUser({ name: "", email: "" });
      handleFetchUsers(); // Refresh list
    }
  };

  const handleDeleteUser = async (id: number) => {
    await deleteUser(HttpMethod.DELETE, `/users/${id}`);
    handleFetchUsers(); // Refresh list
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Generic HTTP Hook Example</h2>

      <section style={{ marginBottom: "20px" }}>
        <h3>Fetch Users (GET)</h3>
        <button onClick={handleFetchUsers} disabled={fetchingUsers}>
          {fetchingUsers ? "Loading..." : "Fetch Users"}
        </button>
        {fetchError && <p style={{ color: "red" }}>Error: {fetchError}</p>}
        <ul>
          {users?.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email}){" "}
              <button
                onClick={() => handleDeleteUser(user.id)}
                disabled={deletingUser}
                style={{ marginLeft: "10px", color: "red" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Create User (POST)</h3>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <button onClick={handleCreateUser} disabled={creatingUser}>
            {creatingUser ? "Creating..." : "Create"}
          </button>
        </div>
        {createError && <p style={{ color: "red" }}>Error: {createError}</p>}
      </section>
      
       {/* DELETE Error Display */}
       {deleteError && <p style={{ color: "red" }}>Delete Error: {deleteError}</p>}
    </div>
  );
};

export default HttpExample;
