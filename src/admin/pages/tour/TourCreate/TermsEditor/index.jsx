import React, { useState } from "react";
import TinyEditor from "../../TinyEditor";

const TermsEditor = ({ terms, setTerms, termOptions }) => {
  const [selectedTerm, setSelectedTerm] = useState("");
  const [description, setDescription] = useState("");

  const addTerm = () => {
    if (!selectedTerm) return;
    setTerms([
      ...terms,
      {
        index: terms.length,
        termId: selectedTerm,
        description,
      },
    ]);
    setSelectedTerm("");
    setDescription("");
  };

  const removeTerm = (idx) => {
    setTerms(terms.filter((_, i) => i !== idx));
  };

  return (
    <div className="terms-editor">
      <h4>Điều khoản</h4>
      <ul>
        {terms.map((t, idx) => (
          <li key={idx}>
            <span>{termOptions.find((o) => o._id === t.termId)?.title}</span>
            <div dangerouslySetInnerHTML={{ __html: t.description }} />
            <button type="button" onClick={() => removeTerm(idx)}>
              ❌
            </button>
          </li>
        ))}
      </ul>

      <div className="term-form">
        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
        >
          <option value="">-- Chọn điều khoản --</option>
          {termOptions.map((t) => (
            <option key={t._id} value={t._id}>
              {t.title}
            </option>
          ))}
        </select>

        {/* TinyMCE cho mô tả */}
        <TinyEditor value={description} onChange={setDescription} />

        <button type="button" onClick={addTerm}>
          + Thêm
        </button>
      </div>
    </div>
  );
};

export default TermsEditor;
