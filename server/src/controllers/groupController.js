import Group from "../model/Group.js";

export const getUserGroups = async (req, res) => {
  const id = req.params.id;

  try {
    const users = await Group.getUserGroup(id);
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
    console.error("Error adding user group: ", error);
    res.status(500).json({
      message: "Failed to add group",
      error: error.message,
    });
  }
};

export const getGroupMembers = async (req, res) => {
  const id = req.params.id;
  try {
    const users = await Group.getById(id);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error adding user group: ", error);
    res.status(500).json({
      message: "Failed to add group",
      error: error.message,
    });
  }
};
