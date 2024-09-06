var token = ""

function login() {
    var Name = document.getElementById("login").value
    var Password = document.getElementById("password").value;
    console.log("Name", Name);

    // var authorizationBasic = $.base64.btoa(clientId + ':' + clientSecret);
    var authorizationBasic = window.btoa(Name + ':' + Password);

    var request = new XMLHttpRequest();
    request.open('POST', "https://01.kood.tech/api/auth/signin", true);
    // request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.setRequestHeader('Authorization', 'Basic ' + authorizationBasic);
    // request.setRequestHeader('Accept', 'application/json');
    request.send();

    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            var response = JSON.parse(request.responseText);
            console.log("test", request.responseText);
            
            if (typeof response === "string") {
                console.log("response", response);
                token = response;
                getUserDetails();
            } else {
                alert(response.error);

            }
        //    alert(request.responseText);
        }
    };
}

// function getUserDetails() {
//     var request = new XMLHttpRequest();
//     request.open('POST', "https://01.kood.tech/api/graphql-engine/v1/graphql", true);
//     // request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
//     request.setRequestHeader('Authorization', 'Bearer ' + token);
//     // request.setRequestHeader('Accept', 'application/json');
    
//     // var data = JSON.stringify({
//     //     query: `{
//     //       user {
//     //         id
//     //         login
//     //       }
//     //     }`,
//     //   });
//     var data = JSON.stringify({
//         query: `{
//             transaction {
//                 type
//                 amount
//                 createdAt
//                 event {
//                     path
//                 }
//             }
//         }`
//     })
//     request.send(data);

//     request.onreadystatechange = function() {
//         if (request.readyState === 4) {
//             // console.log("test", request.responseText);
//             var data2 = JSON.parse(request.responseText)
//             // console.log(data2)
//             var total = 0 
//             var paths = {}
//             for (i of data2.data.transaction) {
//                 paths[i.event.path] = "poop"
//                 if (i.type === "xp" && i.event.path === "/johvi/div-01") {
//                     console.log(i)
//                     total += i.amount
//                 }
//             }
//             console.log(total)
//             console.log(Object.keys(paths))
//             // console.log("login in:", data2.data.user[0].login)
//         }
//     };
// }

function getUserDetails() {
    var request = new XMLHttpRequest();
    request.open('POST', "https://01.kood.tech/api/graphql-engine/v1/graphql", true);
    request.setRequestHeader('Authorization', 'Bearer ' + token);
    
    var data = JSON.stringify({
        query: `{
            transaction(where: {type: {_eq: "xp"}}) {
                amount
                createdAt
                event {
                    path
                }
            }
        }`
    });
    request.send(data);

    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            var response = JSON.parse(request.responseText);
            var transactions = response.data.transaction;
            var totalXP = 0;
            var xpData = transactions.map(t => {
                if (t.event.path === "/johvi/div-01") {
                    console.log(t.amount);
                    totalXP += t.amount;
                    return {
                        date: new Date(t.createdAt),
                        xp: totalXP
                    };
                }
            }).filter(Boolean);

            drawSVGGraph(xpData);
        }
    };
}

function drawSVGGraph(xpData) {
    // Filter out data from 2023
    xpData = xpData.filter(d => d.date.getFullYear() !== 2023);

    // Clear any existing SVG
    d3.select("#graph-container").html("");

    // Define dimensions
    var width = 500;
    var height = 300;
    var padding = 50;

    // Find min and max dates for scaling (after filtering)
    var minDate = d3.min(xpData, d => d.date);
    var maxDate = d3.max(xpData, d => d.date);

    // Define scales
    var xScale = d3.scaleTime()
                   .domain([minDate, maxDate])
                   .range([padding, width - padding]);

    var yScale = d3.scaleLinear()
                   .domain([0, d3.max(xpData, d => d.xp)])
                   .range([height - padding, padding]);

    // Log the XP values corresponding to each month
    xpData.forEach(d => {
        let month = d3.timeFormat("%m")(d.date);  // Format the date to get the month as "MM"
        console.log(`Month: ${month}, XP: ${d.xp}`);
    });

    // Create SVG element and append to the graph container
    var svg = d3.select("#graph-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

    // Create line generator
    var line = d3.line()
                 .x(d => xScale(d.date))
                 .y(d => yScale(d.xp));

    // Append the line to the SVG
    svg.append("path")
       .datum(xpData)
       .attr("fill", "none")
       .attr("stroke", "blue")
       .attr("stroke-width", 2)
       .attr("d", line);

    // Add X Axis (Dates with MM format)
    svg.append("g")
       .attr("transform", `translate(0, ${height - padding})`)
       .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m")));

    // Add Y Axis (XP)
    svg.append("g")
       .attr("transform", `translate(${padding}, 0)`)
       .call(d3.axisLeft(yScale));
}
