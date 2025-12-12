package ec.mil.dsndft.servicio_catalogos.config;

import ec.mil.dsndft.servicio_catalogos.model.mapper.UserMapper;
import org.mapstruct.factory.Mappers;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {

    @Bean
    public UserMapper userMapper() {
        return Mappers.getMapper(UserMapper.class);
    }
}
