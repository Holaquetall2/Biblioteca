import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

function Card(props: Props) {
  const { children } = props;
  return (
    <div
      class="card"
      style={{
        width: "350px",
      }}
    >
      <div class="card-body">{children}</div>
    </div>
  );
}

interface CardBodyProps {
  title: string;
  text?: string;
}

export function CardBody(props: CardBodyProps) {
  const { title, text } = props;
  return (
    <>
      <h5 class="card-title">{title}</h5>
      <p class="card-text">{text}</p>
    </>
  );
}
export default Card;
