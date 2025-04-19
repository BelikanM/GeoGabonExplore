import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Stack,
} from "@mui/material";
import axios from "axios";

function RepoList() {
  const [repos, setRepos] = useState([]);
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:6000/api/repos").then((res) => setRepos(res.data));
  }, []);

  const createRepo = () => {
    if (!repoName) return alert("Le nom est requis");
    axios
      .post("http://127.0.0.1:6000/api/repos", { name: repoName, description })
      .then((res) => {
        setRepos([...repos, res.data]);
        setRepoName("");
        setDescription("");
      });
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Vos Repositories
      </Typography>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Stack spacing={2}>
          <TextField
            label="Nom du repository"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <Button variant="contained" onClick={createRepo}>
            Créer un repository
          </Button>
        </Stack>
      </Paper>

      <List>
        {repos.map((repo) => (
          <ListItem key={repo.id} divider>
            <ListItemText
              primary={repo.name}
              secondary={repo.description || "Pas de description"}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default RepoList;

