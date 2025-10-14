import Group from "../model/Group.js";

export const getUserGroups = async (req, res) => {
  const id = req.params.id;

  try {
    const users = await Group.getAll(id);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching user group: ", error);
    res.status(500).json({
      message: "Failed to fetch list of user groups",
      error: error.message,
    });
  }
};

export const addGroup = async (req, res) => {
  const { id, name } = req.body;

  try {
    const users = await Group.addGroup(id, name);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error adding user group: ", error);
    res.status(500).json({
      message: "Failed to add group",
      error: error.message,
    });
  }
};

export const updateGroup = async (req, res) => {
  const { id, name } = req.body;

  try {
    const users = await Group.updateGroup(id, name);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error updating group: ", error);
    res.status(500).json({
      message: "Failed to update group",
      error: error.message,
    });
  }
};

export const getGroup = async (req, res) => {
  const id = req.params.id;
  try {
    const users = await Group.get(id);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching group: ", error);
    res.status(500).json({
      message: "Failed to fetch group",
      error: error.message,
    });
  }
};

export const addMember = async (req, res) => {
  const id = req.params.id;
  const { teamId } = req.body;
  try {
    const users = await Group.addMember(teamId, id);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error adding user group member: ", error);
    res.status(500).json({
      message: "Failed to add group member",
      error: error.message,
    });
  }
};

export const removeMember = async (req, res) => {
  const id = req.params.id;
  const { groupId } = req.body;

  try {
    const result = await Group.removeMember(groupId, id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(400).json({ message: error.message });
  }
};
