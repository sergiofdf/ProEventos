using System;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProEventos.Application.Contratos;
using ProEventos.Application.Dtos;
using ProEventos.Domain.Identity;
using ProEventos.Persistence.Contratos;

namespace ProEventos.Application
{
  public class AccountService : IAccountService
  {
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IMapper _mapper;
    private readonly IUserPersist _userPersist;

    public AccountService(UserManager<User> userManager,
                         SignInManager<User> signInManager,
                         IMapper mapper,
                         IUserPersist userPersist
        )
    {
      _userManager = userManager;
      _signInManager = signInManager;
      _mapper = mapper;
      _userPersist = userPersist;
    }
    public async Task<SignInResult> CheckUserPasswordAsync(UserUpdateDto userUpdateDto, string password)
    {
      try
      {
        var user = await _userManager.Users
                            .SingleOrDefaultAsync(user => user.UserName == userUpdateDto.UserName.ToLower());
        return await _signInManager.CheckPasswordSignInAsync(user, password, false);
      }
      catch (System.Exception ex)
      {
        
        throw new Exception($"Erro ao tentar verificar password. Erro: {ex.Message}");
      }
    }

    public async Task<UserDto> CreateAccountAsync(UserDto userDto)
    {
      try
      {
        var user = _mapper.Map<User>(userDto);
        var result = await _userManager.CreateAsync(user, userDto.Password);

        if(result.Succeeded)
        {
            var userReturn = _mapper.Map<UserDto>(user);
            return userReturn;
        }

        return null;

      }
      catch (System.Exception ex)
      {
        
        throw new Exception($"Erro ao tentar criar usuário. Erro: {ex.Message}");
      }
    }

    public async Task<UserUpdateDto> GetUserByUserNameAsync(string userName)
    {
      try
      {
        var user = await _userPersist.GetUserByUsernameAsync(userName);
        if (user == null) return null;

        var userUpdateDto = _mapper.Map<UserUpdateDto>(user);
        return userUpdateDto;
      }
      catch (System.Exception ex)
      {
        
        throw new Exception($"Erro ao tentar pegar usuário por username. Erro: {ex.Message}");
      }
    }

    public async Task<UserUpdateDto> UpdateAccount(UserUpdateDto userUpdateDto)
    {
      try
      {
        var user = await _userPersist.GetUserByUsernameAsync(userUpdateDto.UserName);
        if(user == null) return null;

        _mapper.Map(userUpdateDto, user);

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, userUpdateDto.Password);
        
        _userPersist.Update<User>(user);

        if (await _userPersist.SaveChangesAsync())
        {
            var userRetorno = await _userPersist.GetUserByUsernameAsync(user.UserName);

            return _mapper.Map<UserUpdateDto>(userRetorno);
        }
        return null;
      }
      catch (System.Exception ex)
      {
        
        throw new Exception($"Erro ao tentar atualizar usuário. Erro: {ex.Message}");
      }
    }

    public async Task<bool> UserExists(string userName)
    {
      try
      {
        return await _userManager.Users.AnyAsync(user => user.UserName == userName.ToLower());
      }
      catch (System.Exception ex)
      {
        
        throw new Exception($"Erro ao verificar se o usuário existe. Erro: {ex.Message}");
      }
    }
  }
}