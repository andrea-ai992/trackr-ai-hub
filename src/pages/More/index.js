**src/pages/More/index.js**
```jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { styled } from 'styled-components';
import { supabase } from '../utils/supabase';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const Container = styled.div`
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
  font-family: var(--font-inter);
`;

const Badge = styled.div`
  background-color: var(--bg2);
  color: var(--t2);
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  margin: 8px;
  cursor: pointer;
`;

const LinkButton = styled(Link)`
  text-decoration: none;
  color: var(--t1);
  &:hover {
    color: var(--green);
  }
`;

function MorePage() {
  const location = useLocation();
  const [newBadges, setNewBadges] = React.useState([]);
  const [liveBadges, setLiveBadges] = React.useState([]);

  React.useEffect(() => {
    const getNewBadges = async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('id, name, status')
        .eq('status', 'new');
      if (error) {
        console.error(error);
      } else {
        setNewBadges(data);
      }
    };
    const getLiveBadges = async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('id, name, status')
        .eq('status', 'live');
      if (error) {
        console.error(error);
      } else {
        setLiveBadges(data);
      }
    };
    getNewBadges();
    getLiveBadges();
  }, []);

  return (
    <Container>
      <h1>Badges</h1>
      <h2>New Badges</h2>
      <div>
        {newBadges.map((badge) => (
          <Badge key={badge.id}>{badge.name} - NEW</Badge>
        ))}
      </div>
      <h2>Live Badges</h2>
      <div>
        {liveBadges.map((badge) => (
          <Badge key={badge.id}>{badge.name} - LIVE</Badge>
        ))}
      </div>
      <div>
        <LinkButton to="/more/new-badge">
          <Badge>Nouveau Badge</Badge>
        </LinkButton>
      </div>
    </Container>
  );
}

export default MorePage;
```

**src/pages/More/index.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

body {
  font-family: var(--font-inter);
}

.container {
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
}

.badge {
  background-color: var(--bg2);
  color: var(--t2);
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  margin: 8px;
  cursor: pointer;
}

.link-button {
  text-decoration: none;
  color: var(--t1);
  &:hover {
    color: var(--green);
  }
}
```

**src/utils/supabase.js**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export default supabase;
```

N'oubliez pas de remplacer `https://your-supabase-url.supabase.co`, `your-supabase-key` et `your-supabase-secret` par vos informations de Supabase.