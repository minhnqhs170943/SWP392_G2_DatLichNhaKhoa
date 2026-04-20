const { sql } = require('../config/db');

const getAllServices = async () => {
    const request = new sql.Request();
    const result = await request.query('SELECT * FROM Services');
    return result.recordset;
};

const createService = async (serviceName, description, price) => {
    const request = new sql.Request();
    request.input('serviceName', sql.NVarChar(100), serviceName);
    request.input('description', sql.NVarChar(sql.MAX), description);
    request.input('price', sql.Decimal(18, 2), price);
    const result = await request.query(
        'INSERT INTO Services (ServiceName, Description, Price, IsActive) VALUES (@serviceName, @description, @price, 1); SELECT SCOPE_IDENTITY() AS ServiceID;'
    );
    return result.recordset[0];
};

const updateService = async (id, serviceName, description, price, isActive) => {
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    request.input('serviceName', sql.NVarChar(100), serviceName);
    request.input('description', sql.NVarChar(sql.MAX), description);
    request.input('price', sql.Decimal(18, 2), price);
    request.input('isActive', sql.Bit, isActive);
    
    await request.query(
        'UPDATE Services SET ServiceName = @serviceName, Description = @description, Price = @price, IsActive = @isActive WHERE ServiceID = @id'
    );
};

const deleteService = async (id) => {
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    // Hard delete or Soft delete depending on requirement. The schema has IsActive, maybe switch to IsActive = 0?
    // User requested: "cho phép thêm sửa xóa các dịch vụ". Let's do a hard delete to be simple, or throw if used, or just soft delete.
    // Let's do soft delete to prevent breaking Appointments table.
    await request.query('UPDATE Services SET IsActive = 0 WHERE ServiceID = @id');
};

module.exports = { getAllServices, createService, updateService, deleteService };