import { runSimulation } from '../engines/simulation/simulationEngine.js';
import * as componentService from './componentService.js';
import type { SimulationRequest } from '../validators/schemas.js';

export async function runTrafficSimulation(request: SimulationRequest) {
  const slugs = [...new Set(request.nodes.map((n) => n.data.componentId))];
  const componentMap = await componentService.getComponentMap(slugs);

  return runSimulation(
    request.nodes,
    request.edges,
    request.rps,
    componentMap,
    request.disabledComponents ?? [],
  );
}
