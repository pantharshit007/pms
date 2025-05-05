<details>
  <summary>Replica Set Setup and Usage Info</summary>

### Replica Set Initialization

When you run `rs.initiate()` for the first time, MongoDB creates a replica set configuration and your node becomes the PRIMARY.

Example output:

```json
{
  "info2": "no configuration specified. Using a default configuration for the set",
  "me": "localhost:27017",
  "ok": 1
}
```

### How to do it?

#### 1. Stop the currently running MongoDB server

If MongoDB is running as a service, you need to stop it first.

- On **Windows** (if installed as a service):

```powershell
net stop MongoDB
```

- On **Linux/macOS** (if running as a service):

```bash
sudo systemctl stop mongod
```

Or if you started it manually, just close the terminal or kill the process.

---

#### 2. Start MongoDB with replication enabled

You need to start `mongod` with the `--replSet` option.

Open a terminal and run:

```bash
mongod --dbpath /path/to/your/data --replSet rs0
```

- Replace `/path/to/your/data` with the actual path where your MongoDB data files are stored.
- `rs0` is the replica set name (you can choose any name, but `rs0` is common).

If you don’t know your data path, the default is usually:

- Windows: `C:\data\db`
- macOS/Linux: `/data/db`

If the folder doesn’t exist, create it first.

---

#### 3. Connect to MongoDB shell and initiate the replica set

Open another terminal and run:

```bash
mongosh
```

Then run:

```js
rs.initiate();
```

You should see a success message like:

```json
{
  "ok": 1
}
```

---

#### 4. Connect with MongoDB Compass

Now open MongoDB Compass and connect to:

```
mongodb://localhost:27017
```

You can now use the replica set features.

---

#### Optional: Make replication permanent (using config file)

If you want MongoDB to always start with replication enabled (so you don’t have to start it manually every time), edit the `mongod.conf` file:

- Find your `mongod.conf` file (common locations):

  - Windows: `C:\Program Files\MongoDB\Server\<version>\bin\mongod.cfg`
  - Linux/macOS: `/etc/mongod.conf`

- Add or edit the replication section:

```yaml
replication:
  replSetName: "rs0"
```

- Save the file and restart the MongoDB service:

```bash
sudo systemctl restart mongod
```

or on Windows:

```powershell
net stop MongoDB
net start MongoDB
```

---

### Do I need to run `rs.initiate()` every time?

**No!** Once the replica set is initiated and MongoDB is started with replication enabled, the configuration is saved on disk.

You only need to run `rs.initiate()` once.

### What you _do_ need to do every time:

- Start MongoDB with the replication option enabled, either by:

  - Starting `mongod` with the `--replSet rs0` option, or
  - Configuring `mongod.conf` with:

  ```yaml
  replication:
    replSetName: "rs0"
  ```

- Then start or restart MongoDB normally.

### What happens if you start MongoDB without replication enabled?

- The replica set config is ignored.
- You will get errors if you try to run `rs.initiate()` again.

### Summary

| Scenario                                 | Action Needed on Restart       |
| ---------------------------------------- | ------------------------------ |
| Start MongoDB with `--replSet`           | No need to run `rs.initiate()` |
| Start MongoDB without `--replSet`        | Must run `rs.initiate()` again |
| Configure `mongod.conf` with replSetName | No need to run `rs.initiate()` |

---

If you want to avoid running `rs.initiate()` manually every time, configure replication in your `mongod.conf` and restart MongoDB.

</details>
