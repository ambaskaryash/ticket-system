import { useState, useEffect, useCallback } from 'react';
import { getAgents as apiGetAgents, addAgent as apiAddAgent, updateAgent as apiUpdateAgent, deleteAgent as apiDeleteAgent } from '../utils/api';

export function useAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGetAgents();
      const list = Array.isArray(data) ? data : Array.isArray(data?.agents) ? data.agents : [];
      setAgents(list);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch agents");
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const addAgent = useCallback(
    async (agentData) => {
      setAgents((prev) => [...prev, agentData]);
      try {
        await apiAddAgent(agentData);
        fetchAgents();
      } catch (err) {
        setAgents((prev) => prev.filter((a) => a.email !== agentData.email));
        throw err;
      }
    },
    [fetchAgents]
  );

  const updateAgent = useCallback(
    async (agentData) => {
      const prev = [...agents];
      setAgents((list) => list.map((a) => (a.email === agentData.email ? { ...a, ...agentData } : a)));
      try {
        await apiUpdateAgent(agentData);
      } catch (err) {
        setAgents(prev);
        throw err;
      }
    },
    [agents]
  );

  const deleteAgent = useCallback(
    async (email) => {
      const prev = [...agents];
      setAgents((list) => list.filter((a) => a.email !== email));
      try {
        await apiDeleteAgent(email);
      } catch (err) {
        setAgents(prev);
        throw err;
      }
    },
    [agents]
  );

  return {
    agents,
    loading,
    error,
    addAgent,
    updateAgent,
    deleteAgent,
    fetchAgents,
    agentNames: agents.map((a) => a.name),
  };
}
