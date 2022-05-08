const fs = require('fs');
const axios = require('axios');

function getGridFromFile() {
  try {
    const txtfile = fs.readFileSync('./grid.json', 'utf8');
    grid = JSON.parse(txtfile)
    return grid
  } catch (err) {
    console.error(err);
    return ''
  }
}

function getSnapshot(simulationId, elapsedminutes, snapshottime) {
  return axios.get("http://localhost:4000/snapshot/"+simulationId+"/"+elapsedminutes+"/"+snapshottime)
}

async function retryGetSnapshot(simulationId, elapsedminutes, snapshottime) {
  // Retry for 500 times, i.e. 16 minutes
  for (let i = 0; i < 500; i++) {
    let snap = await getSnapshot(simulationId, elapsedminutes, snapshottime)
    if (snap.data.features.length > 0) {
      return snap
    } else {
      const timeout = 2000;
      console.log('Waiting', timeout, 'ms');
      await wait(timeout);
      console.log('Retrying');
    }
  }
}

function wait (timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeout);
  });
}

var grid = getGridFromFile()
grid.snapshottime = 10
grid.horizon = 200

if (grid != '') {
  axios.post("http://localhost:4000/start", grid).then((res) => {
    console.log("Start Simulation -> simulationId:")
    console.log(res.data)

    if (res.status != 200) {
      console.error("Something went wrong when starting the simulation.")
      return
    }
    
    let simulationId = res.data;

    // Take the first snapshot at time 0 and check its correctness
    retryGetSnapshot(simulationId, 0, 10).then(res => {
      var snapshot0 = res.data
      fs.writeFile("./snapshot0.json", JSON.stringify(snapshot0), err => {
        if (err) {
          console.error(err)
          return
        }
      })
      if (JSON.stringify(grid) != JSON.stringify(snapshot0)) {
        console.error("Test 1 failed: Grids are different.")
        return
      } else {
        console.log("Test 1 passed.")
      }

      // Take the first snapshot after time 0 and check its correctness
      retryGetSnapshot(simulationId, 10, 10).then(res => {
        var snapshot1 = res.data
        fs.writeFile("./snapshot1.json", JSON.stringify(snapshot1), err => {
          if (err) {
            console.error(err)
            return
          }
        })
        
        // Check that all polygons in snapshot1 are also in grid
        // Check that all cells that have fire=1 in grid, have fire!=0 in snapshot1
        if (snapshot1.features.length != grid.features.length) {
          console.error("Test 2 failed: Snapshot grid and initialstate grid have different length.")
        } else {
          console.log("Test 2 passed.")
        }
        for (let x of snapshot1.features) {
          for (let y of grid.features) {
            if (JSON.stringify(x.geometry.coordinates) === JSON.stringify(y.geometry.coordinates)) {
              if (y.properties.fire == 1) {
                if (x.properties.fire == 0) {
                  console.error("Test 4 failed: Initialstate cell has 1, but snapshot cell has 0.")
                }
              }
              break
            }
            console.error("Test 3 failed: Snapshot grid and initialstate grid have different coordinates.")
          }
        }
        console.log("Test 3 and 4 passed.")
      })
      .catch(error => {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
        console.log(error.config);
        return
      })
    })
    .catch(error => {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
      console.log(error.config);
      return
    })
  })
  .catch(error => {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log('Error', error.message);
    }
    console.log(error.config);
    return
  })
}