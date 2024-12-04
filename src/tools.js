export const createPortal = (id) => {
  const root = document.createElement("div");
  root.id = id;
  root.classList.add("botContainer");
  document.body.appendChild(root);
  return root;
};
