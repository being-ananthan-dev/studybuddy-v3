const fetchAirforceModels = async () => {
  try {
    const res = await fetch('https://api.airforce/v1/models');
    const data = await res.json();
    console.log('Available Models:', data.data.slice(0, 10).map(m => m.id));
  } catch(e) {
    console.log('Failed:', e.message);
  }
};
fetchAirforceModels();
