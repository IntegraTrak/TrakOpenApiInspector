import OpenAPIClientAxios, { OpenAPIV3 } from "openapi-client-axios";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { OpenApiContextType } from "../@types/openapistate";
import { OpenApiContext } from "../components/OpenApiContext";
import OpenApiDefinition from "../components/OpenApiDefinition";

export default function Home() {
  const { saveOpenApiState } = useContext(OpenApiContext) as OpenApiContextType;

  function handleLoadAPI(definition: string | OpenAPIV3.Document | undefined) {
    if (!definition) return;

    const localApi = new OpenAPIClientAxios({
      definition,
    });
    localApi.init().then(() => {
      console.log(localApi);
      saveOpenApiState({ api: localApi, operators: localApi.getOperations() });
    });
  }

  return (
    <div className="App">
      <h1>Trak Open API Inspector</h1>

      <OpenApiDefinition onHandleLoadApi={(def) => handleLoadAPI(def)} />
      <Link to="/Export">Data Export</Link>
      <Link to="/Import">Data Import</Link>
    </div>
  );
}
