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
      if (snapshot1.features.length != grid.features.length) {
        console.error("Test 1 failed: Snapshot0 grid and initialstate grid have different length.")
        console.error("Snapshot0 has length "+snapshot0.features.length+ "and initialstate has "+grid.features.length)
      } else {
        console.log("Test 1 passed.")
      }
      for (let x of snapshot0.features) {
        for (let y of grid.features) {
          if (JSON.stringify(x.geometry.coordinates) === JSON.stringify(y.geometry.coordinates)) {
            if (x.properties.fire == y.properties.fire) {
              console.error("Test 2 failed: Initialstate cell has "+x.properties.fire+", but snapshot0 cell has "+y.properties.fire+".")
              console.error("Comparing cells (snapshot0): "+x.geometry.coordinates)
              console.error("And (initialstate): "+y.geometry.coordinates)
            }
            break
          }
          console.error("Test 3 failed: Snapshot0 grid and initialstate grid have different coordinates.")
          console.error("Namely, snapshot1 cell "+x+" is not in initialstate.")
        }
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
          console.error("Test 4 failed: Snapshot grid and initialstate grid have different length.")
          console.error("Snapshot1 has length "+snapshot1.features.length+ "and initialstate has "+grid.features.length)
        } else {
          console.log("Test 4 passed.")
        }
        for (let x of snapshot1.features) {
          for (let y of grid.features) {
            if (JSON.stringify(x.geometry.coordinates) === JSON.stringify(y.geometry.coordinates)) {
              if (y.properties.fire == 1) {
                if (x.properties.fire == 0) {
                  console.error("Test 6 failed: Initialstate cell has 1, but snapshot cell has 0.")
                  console.error("Comparing cells (snapshot1): "+x.geometry.coordinates)
                  console.error("And (initialstate): "+y.geometry.coordinates)
                }
              }
              break
            }
            console.error("Test 5 failed: Snapshot grid and initialstate grid have different coordinates.")
            console.error("Namely, snapshot1 cell "+x+" is not in initialstate.")
          }
        }
        console.log("Test 5 and 6 passed.")
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