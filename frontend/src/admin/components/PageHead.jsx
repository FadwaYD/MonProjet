import React from "react";

export default function PageHead({ crumb, title, description, actions }) {
  return (
    <div className="gl-page-head">
      <div>
        {crumb && <div className="gl-breadcrumb">{crumb}</div>}
        <h1>{title}</h1>
        {description && <p className="desc">{description}</p>}
      </div>
      {actions && <div className="gl-page-head-actions">{actions}</div>}
    </div>
  );
}
