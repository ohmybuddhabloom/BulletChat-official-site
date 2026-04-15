import SunyataLanding from './pages/SunyataLanding.jsx'
import StoryPage from './pages/StoryPage.jsx'
import { SACRED_STORIES_BY_SLUG } from './content/sacredStories.js'

const STORY_NAV = {
  logo: 'Buddha Chat',
  links: [
    { label: 'The Path', href: '#path' },
    { label: 'The App', href: '#sanctuary' },
    { label: 'Proverb', href: '#vessels' },
    { label: 'Story', href: '#silence' },
  ],
}

function App() {
  const params = new URLSearchParams(window.location.search)
  const storySlug = params.get('story')
  const story = storySlug ? SACRED_STORIES_BY_SLUG[storySlug] : null

  return story ? <StoryPage nav={STORY_NAV} story={story} /> : <SunyataLanding />
}

export default App
