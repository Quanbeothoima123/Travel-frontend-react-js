import React from "react";
import TinyEditor from "../../TinyEditor";
import "./SpecialExperienceEditor.css";
const SpecialExperienceEditor = ({ value, setValue }) => {
  return (
    <div className="special-experience-editor">
      <h4>Trải nghiệm đặc biệt</h4>
      <TinyEditor value={value} onChange={setValue} />
    </div>
  );
};

export default SpecialExperienceEditor;
