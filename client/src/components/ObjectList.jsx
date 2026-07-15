import React from "react";
import useSceneStore from "../store/useSceneStore.js";
import { deleteObject as apiDeleteObject } from "../api.js";

export default function ObjectList() {
  const objects = useSceneStore((s) => s.objects);
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId);
  const selectObject = useSceneStore((s) => s.selectObject);
  const removeObject = useSceneStore((s) => s.removeObject);

  const handleDelete = async (e, objectId) => {
    e.stopPropagation();
    await apiDeleteObject(objectId);
    removeObject(objectId);
  };

  return (
    <div className="panel-block">
      <div className="panel-block-header">
        <span>Scene Objects ({objects.length})</span>
      </div>
      {objects.length === 0 ? (
        <p className="hint-text">No objects yet.</p>
      ) : (
        <ul className="object-list">
          {objects.map((o) => (
            <li
              key={o.objectId}
              className={"object-row" + (o.objectId === selectedObjectId ? " object-row-active" : "")}
              onClick={() => selectObject(o.objectId)}
            >
              <span className="color-dot" style={{ background: o.color }} />
              <span className="object-label">{o.label}</span>
              <span className="object-type">{o.type}</span>
              <button className="btn-tiny btn-danger" onClick={(e) => handleDelete(e, o.objectId)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
