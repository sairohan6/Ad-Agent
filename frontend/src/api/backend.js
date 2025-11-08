import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const uploadFile = async (file) => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await API.post("/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.path;
};

export const runPipeline = async (command, trainPath, testPath) => {
  const res = await API.post("/run", {
    command,
    train_path: trainPath,
    test_path: testPath,
  });

  return res.data.job_id;
};

export const fetchResults = async (jobId) =>
  (await API.get(`/results/${jobId}`)).data;
