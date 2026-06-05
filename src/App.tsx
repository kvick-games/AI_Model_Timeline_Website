import {TimelineExperience} from '@kvick-games/timeline-library';
import {aiTimelineDefinition} from './data/aiTimelineDefinition';

export default function App() {
  return <TimelineExperience definition={aiTimelineDefinition} />;
}
