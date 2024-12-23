import React from "react";
import ArchivedTasks from "../components/ArchivedTasks";

const Archives = ({ archivedTasks }) => {
  return (
    <div className="archives-page">
      <h1>Tâches Archivées</h1>
      <ArchivedTasks tasks={archivedTasks} />
    </div>
  );
};

export default Archives;
