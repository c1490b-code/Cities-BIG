/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthBarrier } from './components/AuthBarrier';
import { Dashboard } from './components/Dashboard';
import { RegistryForm } from './components/RegistryForm';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  const [view, setView] = useState<'dashboard' | 'new'>('dashboard');

  return (
    <AuthBarrier>
      <div className="min-h-screen">
        {view === 'dashboard' ? (
          <Dashboard onNewRegistry={() => setView('new')} />
        ) : (
          <RegistryForm onComplete={() => setView('dashboard')} />
        )}
      </div>
    </AuthBarrier>
  );
}
