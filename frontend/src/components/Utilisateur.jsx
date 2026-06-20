import { useEffect, useState } from "react";
import axios from "axios";

function Utilisateur() {

    const [users, setUsers] = useState([]);

    useEffect(() => {

        axios.get("http://localhost:5000/api/utilisateurs")
            .then((res) => {
                setUsers(res.data);
            })
            .catch((err) => {
                console.log(err);
            });

    }, []);

    return (
        <>
            <h1>Liste des utilisateurs</h1>

            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Email</th>
                    </tr>
                </thead>

                <tbody>
                    {
                        users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.nom}</td>
                                <td>{user.email}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </>
    );
}

export default Utilisateur;