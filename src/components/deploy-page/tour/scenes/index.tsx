import type { Screen } from "../missions";
import type { SceneProps } from "../ui";
import { ConfigureScene } from "./configure";
import { DeploymentScene, TerminalOverlay } from "./deployment";
import { AutoDeployScene, DeploymentsScene, HelloWorldApp } from "./launch";
import { ProjectsScene, TeamScene } from "./scale";
import { OnboardingScene, SignUpScene } from "./start";

const SCREENS: Record<Screen, (props: SceneProps) => JSX.Element> = {
  signup: SignUpScene,
  onboarding: OnboardingScene,
  autodeploy: AutoDeployScene,
  deployments: DeploymentsScene,
  deployment: DeploymentScene,
  app: HelloWorldApp,
  configure: ConfigureScene,
  team: TeamScene,
  projects: ProjectsScene,
};

/** The mock Console screen for the current step. Steps on the same screen
 * share one mounted component, so moving between them animates in place. */
export function Scene(props: SceneProps) {
  const Screen = SCREENS[props.step.screen];
  return (
    <div
      key={`${props.mission}-${props.step.screen}`}
      className="absolute inset-0 duration-500 motion-safe:animate-in motion-safe:fade-in-0"
    >
      <Screen {...props} />
    </div>
  );
}

/** Windows that float over the browser, outside its frame. */
export function SceneOverlay(props: SceneProps) {
  return <TerminalOverlay {...props} />;
}
