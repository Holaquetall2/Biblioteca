import Card, { CardBody } from "./components/Card";
import List from "./components/List";

function App() {
  return (
    <Card>
      <CardBody title="Hola Mundo" text="Este es el texto" />
      <List />
    </Card>
  );
}

export default App;
