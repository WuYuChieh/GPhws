function clamp (val, min, max) { // min <= val <= max
   return Math.min(Math.max(val,min),max);
}

function keyframe(t) {
  var s = ((t - ts) % T) / T;

  for (var i = 1; i < keys.length; i++) {
    if (keys[i][0] > s) break;
  }
  // take i-1
  var ii = i - 1;
  var a = (s - keys[ii][0]) / (keys[ii + 1][0] - keys[ii][0]);
  intKey = [keys[ii][1].lThigh * (1 - a) + keys[ii + 1][1].lThigh * a,
            keys[ii][1].rThigh * (1 - a) + keys[ii + 1][1].rThigh * a
  ];
	return intKey;
}

class Agent {

	constructor(pos, group) {
		this.pos = pos.clone();
		this.vel = new THREE.Vector3();
		this.force = new THREE.Vector3();
		this.target = null;
		this.size = 3;
		this.model = group;
		scene.add (group);

		this.MAXSPEED = 50;
		this.ARRIVAL_R = 30;

		// for orientable agent
		this.angle = 0;
	}

	update(dt) {
		this.accumulateForce();
		this.vel.add(this.force.clone().multiplyScalar(dt));

			// ARRIVAL: velocity modulation
		if (this.target !== null) {   
			let dst = this.target.distanceTo(this.pos);
			if (dst < this.ARRIVAL_R) {  // close enough
				this.vel.setLength(dst);
			}
		}

		// MAXSPEED modulation
		let speed = this.vel.length()
		this.vel.setLength(clamp (speed, 0, this.MAXSPEED))
		this.pos.add(this.vel.clone().multiplyScalar(dt))
		this.model.position.copy(this.pos)

		// for orientable agent
		// non PD version
		if (this.vel.length() > 0.1) {
			this.angle = Math.atan2 (-this.vel.z, this.vel.x)
			this.model.rotation.y = this.angle + Math.PI/2;
		}
	}

	setTarget(x,y,z) {
		if (this.target !== null)
			this.target.set(x,y,z);
		else {
			this.target = new THREE.Vector3(x,y,z);
		}
	}

	targetInducedForce(targetPos) { // seek
		return targetPos.clone().sub(this.pos).setLength(this.MAXSPEED).sub(this.vel);
	}

	accumulateForce() {
		if (this.target) 
			this.force.copy(this.targetInducedForce(this.target));
	}
	
	keyframeAnimation(dt) {
			
	let intKey = keyframe(clock.getElapsedTime());
		if (this.vel.length() >= 1.0) {
			
			body.children[1].rotation.x = intKey[0];	//legs
			body.children[2].rotation.x = intKey[1];  
			
			body.children[3].rotation.x = intKey[1];	//arms
			body.children[4].rotation.x = intKey[0];  
		}
		else {
		
			body.children[1].rotation.x = 0;	//legs
			body.children[2].rotation.x = 0;  

			body.children[3].rotation.x = 0;	//arms
			body.children[4].rotation.x = 0;  
		}
		
		if (this.vel.length() >= 30.0 && this.vel.length() < 50.0) {
			
			pose1.lThigh = Math.PI/4;
			pose1.rThigh = -Math.PI/4;
			pose2.lThigh = -Math.PI/4;
			pose2.rThigh = Math.PI/4;
		}
		if (this.vel.length() >= 10.0 && this.vel.length() < 30.0) {
			
			pose1.lThigh = Math.PI/10;
			pose1.rThigh = -Math.PI/10;
			pose2.lThigh = -Math.PI/10;
			pose2.rThigh = Math.PI/10;
		}
		if (this.vel.length() >= 5.0 && this.vel.length() < 10.0) {
			
			pose1.lThigh = Math.PI/15;
			pose1.rThigh = -Math.PI/15;
			pose2.lThigh = -Math.PI/15;
			pose2.rThigh = Math.PI/15;
		}
	}
}
